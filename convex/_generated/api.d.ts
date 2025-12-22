/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as generateProblemSteps from "../generateProblemSteps.js";
import type * as generateVisualization from "../generateVisualization.js";
import type * as myFunctions from "../myFunctions.js";
import type * as problems from "../problems.js";
import type * as visualizations from "../visualizations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  generateProblemSteps: typeof generateProblemSteps;
  generateVisualization: typeof generateVisualization;
  myFunctions: typeof myFunctions;
  problems: typeof problems;
  visualizations: typeof visualizations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
