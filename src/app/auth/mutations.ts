export const mutations = `#graphql
    signupUser(input: SignupUserInput!): String!
    verifyEmail(input: VerifyEmailInput!): verifyEmailResponse!
    loginUser(input: LoginUserInput!): verifyEmailResponse!
    logoutUser: Boolean!
    forgotPassword(usernameOrEmail: String!): Boolean!
    resetPassword(input: ResetPasswordInput!): Boolean!
`
