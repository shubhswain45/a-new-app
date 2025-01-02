export const mutations = `#graphql
    createTrack(payload: createTrackPayload!): Track
    deleteTrack(trackId: String!): Boolean!
    likeTrack(trackId: String!): Boolean!
`

