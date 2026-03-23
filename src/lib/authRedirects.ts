export function getAuthRedirectPath(input: { isAdmin: boolean }) {
  return input.isAdmin ? "/admin" : "/orders";
}
