import { api, getAuthToken, setAuthToken, getStoredUser, setStoredUser } from "./api/client.js";
import { DEMO_ACCOUNTS } from "./utils/format.js";
import { SEED_PROPERTIES } from "./data/seed.js";

export class AppState {
  constructor() {
    this.subscribers = [];
    this.properties = [];
    this.ownerListings = [];
    this.adminListings = [];
    this.favorites = [];
    this.favoriteItems = [];
    this.inquiries = [];
    this.ownerInquiries = [];
    this.stats = {};
    this.currentUser = getStoredUser();
    this.currentRole = this.currentUser?.role || "operator";
    this.compareList = [];
    this.filters = {
      searchQuery: "",
      city: "All Cities",
      propertyType: "All Types",
      maxPrice: 200000,
      minBedrooms: 0,
      selectedTags: [],
      sortBy: "roi-desc",
      viewMode: "grid"
    };
    this.selectedPropertyId = null;
    this.ready = false;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  notify(event, payload) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event, payload, this);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    });
  }

  async bootstrap() {
    if (this._bootstrapping) return;
    this._bootstrapping = true;
    try {
    if (getAuthToken()) {
      try {
        this.currentUser = await api.me();
        setStoredUser(this.currentUser);
        this.currentRole = this.currentUser.role;
      } catch {
        setAuthToken(null);
        setStoredUser(null);
        this.currentUser = null;
        this.currentRole = "operator";
      }
    }
    await Promise.all([this.loadPublicProperties(), this.loadStats(), this.refreshSessionData()]);
    this.ready = true;
    this.notify("ready", null);
    } finally {
      this._bootstrapping = false;
    }
  }

  async loadStats() {
    try {
      this.stats = await api.stats();
    } catch {
      this.stats = {};
    }
  }

  filterQuery() {
    const f = this.filters;
    const params = {
      sort: f.sortBy,
      page: 1,
      page_size: 50
    };
    if (f.city && f.city !== "All Cities") params.city = f.city;
    if (f.propertyType && f.propertyType !== "All Types") params.property_type = f.propertyType;
    if (f.maxPrice) params.max_price = f.maxPrice;
    if (f.minBedrooms) params.min_bedrooms = f.minBedrooms;
    if (f.searchQuery.trim()) params.search = f.searchQuery.trim();
    return params;
  }

  async loadPublicProperties() {
    try {
      const data = await api.listProperties(this.filterQuery());
      this.properties = data.items || [];
    } catch (err) {
      console.warn("Property load failed", err);
      this.properties = [...SEED_PROPERTIES];
    }
    this.notify("propertiesLoaded", this.properties);
  }

  async refreshSessionData() {
    if (!this.currentUser) {
      this.favorites = [];
      this.favoriteItems = [];
      this.inquiries = [];
      this.ownerListings = [];
      this.adminListings = [];
      this.ownerInquiries = [];
      this.notify("sessionCleared", null);
      return;
    }
    try {
      if (this.currentRole === "operator" || this.currentRole === "admin") {
        const favs = await api.listFavorites();
        this.favorites = favs.property_ids || [];
        this.favoriteItems = favs.items || [];
        const inq = await api.myInquiries();
        this.inquiries = inq.items || [];
      }
      if (this.currentRole === "owner" || this.currentRole === "admin") {
        const mine = await api.ownerProperties();
        this.ownerListings = mine.items || [];
        const leads = await api.ownerInquiries();
        this.ownerInquiries = leads.items || [];
      }
      if (this.currentRole === "admin") {
        const all = await api.adminProperties();
        this.adminListings = all.items || [];
      }
    } catch (err) {
      console.warn("Session data load failed", err);
    }
    this.notify("sessionLoaded", null);
  }

  async login(email, password) {
    const res = await api.login({ email, password });
    setAuthToken(res.access_token);
    this.currentUser = res.user;
    setStoredUser(res.user);
    this.currentRole = res.user.role;
    await Promise.all([this.loadPublicProperties(), this.refreshSessionData()]);
    this.notify("roleChanged", this.currentRole);
    return res.user;
  }

  async signup(payload) {
    const res = await api.signup(payload);
    setAuthToken(res.access_token);
    this.currentUser = res.user;
    setStoredUser(res.user);
    this.currentRole = res.user.role;
    await Promise.all([this.loadPublicProperties(), this.refreshSessionData()]);
    this.notify("roleChanged", this.currentRole);
    return res.user;
  }

  async logout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setAuthToken(null);
    setStoredUser(null);
    this.currentUser = null;
    this.currentRole = "operator";
    this.favorites = [];
    this.favoriteItems = [];
    this.inquiries = [];
    this.ownerListings = [];
    this.adminListings = [];
    this.ownerInquiries = [];
    await this.loadPublicProperties();
    this.notify("roleChanged", this.currentRole);
  }

  async loginDemo(role) {
    const creds = DEMO_ACCOUNTS[role];
    if (!creds) return;
    return this.login(creds.email, creds.password);
  }

  async toggleFavorite(propertyId, toast) {
    if (!this.currentUser) {
      toast?.warning("Sign in to shortlist properties");
      window.location.hash = "#login";
      return false;
    }
    const isFav = this.favorites.includes(propertyId);
    try {
      if (isFav) {
        await api.removeFavorite(propertyId);
        this.favorites = this.favorites.filter((id) => id !== propertyId);
      } else {
        await api.addFavorite(propertyId);
        this.favorites.push(propertyId);
      }
      this.notify("favoritesChanged", { propertyId, isFavorite: !isFav });
      return !isFav;
    } catch (err) {
      toast?.warning(err.message || "Could not update shortlist");
      return isFav;
    }
  }

  isFavorite(propertyId) {
    return this.favorites.includes(propertyId);
  }

  toggleCompare(propertyId) {
    const index = this.compareList.indexOf(propertyId);
    let added = false;
    if (index > -1) {
      this.compareList.splice(index, 1);
    } else {
      if (this.compareList.length >= 3) {
        return { success: false, reason: "Max 3 properties can be compared at once" };
      }
      this.compareList.push(propertyId);
      added = true;
    }
    this.notify("compareChanged", { propertyId, added, count: this.compareList.length });
    return { success: true, added, count: this.compareList.length };
  }

  clearCompare() {
    this.compareList = [];
    this.notify("compareChanged", { count: 0 });
  }

  setFilter(key, value) {
    this.filters[key] = value;
    const skipReload = key === "viewMode" || key === "selectedTags";
    if (skipReload) {
      this.notify("filterChanged", { key, value, filters: this.filters });
      return;
    }
    this.loadPublicProperties().then(() => {
      this.notify("filterChanged", { key, value, filters: this.filters });
    });
  }

  resetFilters() {
    this.filters = {
      searchQuery: "",
      city: "All Cities",
      propertyType: "All Types",
      maxPrice: 200000,
      minBedrooms: 0,
      selectedTags: [],
      sortBy: "roi-desc",
      viewMode: "grid"
    };
    this.loadPublicProperties().then(() => {
      this.notify("filterChanged", { reset: true, filters: this.filters });
    });
  }

  async updatePropertyStatus(propertyId, status) {
    const updated = await api.updateProperty(propertyId, { status });
    const apply = (list) => {
      const idx = list.findIndex((p) => p.id === propertyId);
      if (idx > -1) list[idx] = updated;
    };
    apply(this.properties);
    apply(this.ownerListings);
    apply(this.adminListings);
    this.notify("propertyStatusUpdated", { propertyId, status: updated.status });
    return updated;
  }

  async addInquiry(inquiry) {
    const created = await api.createInquiry(inquiry.property_id, {
      message: inquiry.proposed_terms,
      proposed_tenure_months: inquiry.proposed_tenure_months,
      proposed_rent: inquiry.proposed_rent,
      operator_display_name: inquiry.operator_name,
      portfolio_size: inquiry.portfolio_size
    });
    this.inquiries.unshift(created);
    this.notify("inquiryAdded", created);
    return created;
  }

  getFilteredProperties() {
    return this.properties.filter((p) => {
      if (this.filters.selectedTags.length > 0) {
        const tags = p.str_tags || [];
        const hasAllTags = this.filters.selectedTags.every((tag) => tags.includes(tag));
        if (!hasAllTags) return false;
      }
      return true;
    });
  }

  getPropertyById(id) {
    return (
      this.properties.find((p) => p.id === id) ||
      this.ownerListings.find((p) => p.id === id) ||
      this.adminListings.find((p) => p.id === id) ||
      (this.favoriteItems || []).find((p) => p.id === id)
    );
  }

  async ensureProperty(id) {
    const existing = this.getPropertyById(id);
    if (existing) return existing;
    try {
      const prop = await api.getProperty(id);
      this.properties.push(prop);
      this.notify("propertyLoaded", prop);
      return prop;
    } catch {
      return null;
    }
  }
}

export const store = new AppState();
