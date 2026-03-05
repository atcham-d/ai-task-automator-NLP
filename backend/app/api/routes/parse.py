"""NLP parse route — converts natural language text to a WorkflowDefinition."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.workflow import WorkflowDefinition
from app.nlp.parser import parse_nl_to_workflow

router = APIRouter(prefix="/api/parse", tags=["parse"])


class ParseRequest(BaseModel):
    """Request body containing natural language workflow description."""

    text: str


@router.post("/", response_model=WorkflowDefinition)
async def parse_text(
    body: ParseRequest, user: dict = Depends(get_current_user)
):
    """Parse a natural language description into a structured WorkflowDefinition.

    The NLP parser detects trigger types, conditions, and actions from the text
    and returns a complete WorkflowDefinition JSON structure.
    """
    return parse_nl_to_workflow(body.text)
