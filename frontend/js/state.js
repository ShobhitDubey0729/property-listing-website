/**
 * PropLease state — UI cache backed by FastAPI, not localStorage business data
 */

class AppState {
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
    this.currentUser = window.getStoredUser ? window.getStoredUser() : null;
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
    this.currentStepInWizard = 1;
    this.ready = false;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
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
    if (window.getAuthToken && window.getAuthToken()) {
      try {
        this.currentUser = await window.api.me();
        window.setStoredUser(this.currentUser);
        this.currentRole = this.currentUser.role;
      } catch {
        window.setAuthToken(null);
        window.setStoredUser(null);
        this.currentUser = null;
        this.currentRole = "operator";
      }
    }
    await Promise.all([this.loadPublicProperties(), this.loadStats(), this.refreshSessionData()]);
    this.ready = true;
    this.notify("ready", null);
  }

  async loadStats() {
    try {
      this.stats = await window.api.stats();
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
      const data = await window.api.listProperties(this.filterQuery());
      this.properties = data.items || [];
    } catch (err) {
      console.warn("Property load failed", err);
      this.properties = window.SEED_PROPERTIES ? [...window.SEED_PROPERTIES] : [];
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
      return;
    }
    try {
      if (this.currentRole === "operator" || this.currentRole === "admin") {
        const favs = await window.api.listFavorites();
        this.favorites = favs.property_ids || [];
        this.favoriteItems = favs.items || [];
        const inq = await window.api.myInquiries();
        this.inquiries = inq.items || [];
      }
      if (this.currentRole === "owner" || this.currentRole === "admin") {
        const mine = await window.api.ownerProperties();
        this.ownerListings = mine.items || [];
        const leads = await window.api.ownerInquiries();
        this.ownerInquiries = leads.items || [];
      }
      if (this.currentRole === "admin") {
        const all = await window.api.adminProperties();
        this.adminListings = all.items || [];
      }
    } catch (err) {
      console.warn("Session data load failed", err);
    }
  }

  async login(email, password) {
    const res = await window.api.login({ email, password });
    window.setAuthToken(res.access_token);
    this.currentUser = res.user;
    window.setStoredUser(res.user);
    this.currentRole = res.user.role;
    await Promise.all([this.loadPublicProperties(), this.refreshSessionData()]);
    this.notify("roleChanged", this.currentRole);
    return res.user;
  }

  async signup(payload) {
    const res = await window.api.signup(payload);
    window.setAuthToken(res.access_token);
    this.currentUser = res.user;
    window.setStoredUser(res.user);
    this.currentRole = res.user.role;
    await Promise.all([this.loadPublicProperties(), this.refreshSessionData()]);
    this.notify("roleChanged", this.currentRole);
    return res.user;
  }

  async logout() {
    try {
      await window.api.logout();
    } catch {
      /* ignore */
    }
    window.setAuthToken(null);
    window.setStoredUser(null);
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
    const creds = window.DEMO_ACCOUNTS[role];
    if (!creds) return;
    return this.login(creds.email, creds.password);
  }

  setRole(role) {
    this.loginDemo(role).catch((err) => {
      if (window.Toast) window.Toast.warning(err.message || "Could not switch account");
    });
  }

  async toggleFavorite(propertyId) {
    if (!this.currentUser) {
      if (window.Toast) window.Toast.warning("Sign in to shortlist properties");
      window.location.hash = "#login";
      return false;
    }
    const isFav = this.favorites.includes(propertyId);
    try {
      if (isFav) {
        await window.api.removeFavorite(propertyId);
        this.favorites = this.favorites.filter((id) => id !== propertyId);
      } else {
        await window.api.addFavorite(propertyId);
        this.favorites.push(propertyId);
      }
      this.notify("favoritesChanged", { propertyId, isFavorite: !isFav });
      return !isFav;
    } catch (err) {
      if (window.Toast) window.Toast.warning(err.message || "Could not update shortlist");
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

  addProperty(newProp) {
    this.properties.unshift(newProp);
    this.ownerListings.unshift(newProp);
    this.notify("propertyAdded", newProp);
  }

  async updatePropertyStatus(propertyId, status) {
    try {
      const updated = await window.api.updateProperty(propertyId, { status });
      const apply = (list) => {
        const idx = list.findIndex((p) => p.id === propertyId);
        if (idx > -1) list[idx] = updated;
      };
      apply(this.properties);
      apply(this.ownerListings);
      apply(this.adminListings);
      this.notify("propertyStatusUpdated", { propertyId, status: updated.status });
      return updated;
    } catch (err) {
      if (window.Toast) window.Toast.warning(err.message || "Could not update listing");
      throw err;
    }
  }

  async addInquiry(inquiry) {
    const created = await window.api.createInquiry(inquiry.property_id, {
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
      const prop = await window.api.getProperty(id);
      this.properties.push(prop);
      return prop;
    } catch {
      return null;
    }
  }
}

window.store = new AppState();
