/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appointments from "../appointments.js";
import type * as audit from "../audit.js";
import type * as broadcasts from "../broadcasts.js";
import type * as cleanup from "../cleanup.js";
import type * as conversations from "../conversations.js";
import type * as crons from "../crons.js";
import type * as emergency from "../emergency.js";
import type * as faq from "../faq.js";
import type * as messages from "../messages.js";
import type * as messagesActions from "../messagesActions.js";
import type * as notifications from "../notifications.js";
import type * as presence from "../presence.js";
import type * as seedFaq from "../seedFaq.js";
import type * as typing from "../typing.js";
import type * as upload from "../upload.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  audit: typeof audit;
  broadcasts: typeof broadcasts;
  cleanup: typeof cleanup;
  conversations: typeof conversations;
  crons: typeof crons;
  emergency: typeof emergency;
  faq: typeof faq;
  messages: typeof messages;
  messagesActions: typeof messagesActions;
  notifications: typeof notifications;
  presence: typeof presence;
  seedFaq: typeof seedFaq;
  typing: typeof typing;
  upload: typeof upload;
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
