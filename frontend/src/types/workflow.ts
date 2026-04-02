/**
 * Shared workflow types for the FlowAI frontend.
 */

export interface WorkflowCondition {
    field: string;
    operator: string;
    value: string;
}

export interface WorkflowAction {
    type: string;
    config: Record<string, unknown>;
}

export interface WorkflowTrigger {
    type: string;
    config: Record<string, unknown>;
}

export interface WorkflowDefinition {
    trigger: WorkflowTrigger;
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
}

export interface WorkflowResponse {
    id: string;
    name: string;
    description: string | null;
    status: string;
    definition: WorkflowDefinition;
    run_count: number;
}
