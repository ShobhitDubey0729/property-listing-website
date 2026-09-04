from uuid import UUID

from pydantic import BaseModel


class FavoriteIds(BaseModel):
    property_ids: list[UUID]
