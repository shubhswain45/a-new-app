export const queries = `#graphql
    getUserProfile(username: String!): getUserProfileResponse 
    getUserTracks(payload: GetUserTracksPayload!):[Track]
    getUserPlaylists(userId: String!): UserPlaylistsResponse!
    searchUser(payload: SearchPayload!): [searchUserResponse]
    getUserLikedSongs: [Track]
`