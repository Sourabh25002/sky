import * as dotenv from "dotenv";
dotenv.config();
import { executeWorkflow } from "./functions/execute_workflow.ts";

export const functions = [executeWorkflow];
