from pydantic import BaseModel
from typing import Any, Dict, Optional, List
from decimal import Decimal

class ProjectBase(BaseModel):
    project_id: Optional[str] = None
    name: str
    manager: List[Dict[str, Any]] = []
    team_lead: Optional[List[Dict[str, Any]]] = []
    status: str = "Planning"
    budget: Decimal = Decimal("0.0")
    utilized_budget: Decimal = Decimal("0.0")
    balance_budget: Decimal = Decimal("0.0")
    timeline: str | None = None
    employee_id: Optional[str] = None
    custom_fields: Dict[str, Any] = {}


class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int

    model_config = {"from_attributes": True}
