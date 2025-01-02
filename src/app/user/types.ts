export const types = `#graphql
    type getUserProfileResponse {
        id: ID!
        username: String!
        fullName: String!
        profileImageURL: String
        bio: String
        totalTracks: Int!
        totalFollowers: Int!
        totalFollowings: Int!
        followedByMe: Boolean!
    }

    input GetUserTracksPayload {
        username: String!
        page: Int!
    }
`