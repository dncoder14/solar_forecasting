from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from .llm_client import LLMClient
import json

class AgentState(TypedDict):
    forecast_data: dict
    uncertainty_level: str
    retrieved_knowledge: Optional[str]
    analysis: Optional[str]
    final_report: Optional[dict]

# Initialize LLM client only when needed
llm_client = None

def get_llm_client():
    global llm_client
    if llm_client is None:
        llm_client = LLMClient()
    return llm_client

def forecast_analyst(state: AgentState) -> AgentState:
    """Analyze the power forecast data."""
    forecast = state['forecast_data']
    uncertainty = state['uncertainty_level']

    # Simple analysis - in real implementation, this could be more complex
    summary = f"Forecast shows average power generation of {forecast.get('average_power', 'N/A')} kW with {uncertainty} uncertainty."

    state['analysis'] = summary
    return state

def knowledge_retriever(state: AgentState) -> AgentState:
    """Retrieve relevant grid management knowledge."""
    query = f"Solar forecast optimization for {state['analysis']}"
    knowledge = get_llm_client().retrieve_knowledge(query)
    state['retrieved_knowledge'] = knowledge
    return state

def grid_optimizer(state: AgentState) -> AgentState:
    """Generate optimization recommendations."""
    prompt = f"""
    Based on the forecast analysis: {state['analysis']}

    And relevant guidelines: {state['retrieved_knowledge']}

    Generate a JSON optimization report with the following structure:
    {{
        "summary": "Concise forecast overview",
        "risk_assessment": "Specific periods of low power or high variability",
        "action_plan": "Recommendations for battery storage and load balancing"
    }}

    Ensure the output is valid JSON only.
    """

    response = get_llm_client().generate_response(prompt)

    # Parse JSON response
    try:
        report = json.loads(response)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        report = {
            "summary": "Forecast analysis completed",
            "risk_assessment": "Unable to assess risks due to data issues",
            "action_plan": "Consult manual guidelines for optimization"
        }

    state['final_report'] = report
    return state

# Build the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("forecast_analyst", forecast_analyst)
workflow.add_node("knowledge_retriever", knowledge_retriever)
workflow.add_node("grid_optimizer", grid_optimizer)

# Add edges
workflow.set_entry_point("forecast_analyst")
workflow.add_edge("forecast_analyst", "knowledge_retriever")
workflow.add_edge("knowledge_retriever", "grid_optimizer")
workflow.add_edge("grid_optimizer", END)

# Compile the graph
graph = workflow.compile()

def run_optimization_agent(forecast_data: dict, uncertainty_level: str = "medium") -> dict:
    """Run the optimization agent workflow."""
    initial_state = {
        "forecast_data": forecast_data,
        "uncertainty_level": uncertainty_level,
        "retrieved_knowledge": None,
        "analysis": None,
        "final_report": None
    }

    result = graph.invoke(initial_state)
    return result['final_report']