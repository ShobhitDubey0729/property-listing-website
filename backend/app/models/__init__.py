from app.models.user import LocalCredential, User
from app.models.property import Amenity, NearbyPlace, Property, PropertyAmenity, PropertyImage, SocietyRules
from app.models.inquiry import Inquiry
from app.models.favorite import Favorite

__all__ = [
    "User",
    "LocalCredential",
    "Property",
    "PropertyImage",
    "Amenity",
    "PropertyAmenity",
    "SocietyRules",
    "NearbyPlace",
    "Inquiry",
    "Favorite",
]
