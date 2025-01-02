export const queries = `#graphql
    getFeedTracks(page: Int!):[Track]
    getTrackById(trackId: String!): Track
    searchTrack(payload :SearchPayload!): [Track]
`