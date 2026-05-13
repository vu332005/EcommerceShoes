# Fix Address Data Persistence during Login

The goal is to ensure that user address information (address, city, district) is preserved and correctly loaded into the Redux state after a user logs out and logs back in. Currently, the backend authentication services only return basic user data, missing the associated address records.

## User Review Required

> [!IMPORTANT]
> The fix only includes the **default** address of the user (where `isDefault` is true) in the login response. If a user has multiple addresses, only the primary one will be loaded into the initial profile state.

## Proposed Changes

### Backend (Server)

I will update the `authService.ts` to include address data in all authentication-related responses.

#### [MODIFY] [authService.ts](file:///d:/demo-practice/EcommerceShoes/server/src/services/authService.ts)

1.  **Helper Function**: Add a helper (`mapUserWithAddress`) to extract the default address fields from a User entity.
2.  **`loginService`**: Use `findOne` with `relations: ["addresses"]` to fetch existing addresses.
3.  **`getMeService`**: Use `findOne` with `relations: ["addresses"]` to include address data.
4.  **`loginFacebookService`**: Ensure that when an existing user is found via Facebook login, their address data is also fetched and returned.

### Frontend (Client)

The frontend already handles standard user fields in `authSlice.ts`. Since the field names in the proposed backend response will match what the frontend expects (`address`, `city`, `district`), no major changes are needed in the Redux logic.

## Open Questions

None at this time.

## Verification Plan

### Manual Verification
1.  Log in to the application.
2.  Go to Profile and update the address.
3.  Log out.
4.  Log back in.
5.  Verify that the Address fields in the Profile page are automatically populated with the previously saved data.
