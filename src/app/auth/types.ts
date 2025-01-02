export const types = `#graphql
    type User {
        id: ID!
        username: String!
        fullName: String!
        email: String!
        profileImageURL: String
        isVerified: Boolean!
    }

    type searchUserResponse {
        id: ID!
        username: String!
        fullName: String!
        profileImageURL: String
        totalTracks: Int!
    }

    type verifyEmailResponse {
        id: ID!
        username: String!
        fullName: String!
        email: String!
        profileImageURL: String
        isVerified: Boolean!
        token: String
    }

    input SignupUserInput {
        username: String!
        fullName: String!
        email: String!
        password: String!
    }

    input VerifyEmailInput {
        code: String!
        email: String!
    }

    input LoginUserInput {
        usernameOrEmail: String!
        password: String!
    }


    input ResetPasswordInput {
        token: String!
        newPassword: String!
        confirmPassword: String!
    }
`
