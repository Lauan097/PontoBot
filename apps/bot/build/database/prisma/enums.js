const ServerLinkStatus = {
  active: "active",
  unlinked: "unlinked",
  over_limit: "over_limit"
};
const Action = {
  update_global_weekly_goal_duration: "update_global_weekly_goal_duration",
  update_global_weekly_goal_status: "update_global_weekly_goal_status",
  update_user_weekly_goal_duration: "update_user_weekly_goal_duration",
  update_user_weekly_goal_status: "update_user_weekly_goal_status",
  update_point_open_log_channel_id: "update_point_open_log_channel_id",
  update_point_close_log_channel_id: "update_point_close_log_channel_id"
};
const MemberStatus = {
  active: "active",
  inactive: "inactive",
  banned: "banned",
  out_of_server: "out_of_server"
};
const PointSessionStatus = {
  active: "active",
  paused: "paused",
  finished: "finished",
  cancelled: "cancelled"
};
const PauseStatus = {
  active: "active",
  finished: "finished",
  auto_finished: "auto_finished",
  cancelled: "cancelled"
};
const MemberFlowAction = {
  join: "join",
  leave: "leave",
  ban: "ban"
};
const SubscriptionStatus = {
  pending: "pending",
  authorized: "authorized",
  paused: "paused",
  cancelled: "cancelled"
};
export {
  Action,
  MemberFlowAction,
  MemberStatus,
  PauseStatus,
  PointSessionStatus,
  ServerLinkStatus,
  SubscriptionStatus
};
