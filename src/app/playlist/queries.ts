export const queries = `#graphql
    getCurrentUserPlaylists(username: String!): UserPlaylistsResponse!
    getPlaylistSongs(playlistId: String!): getPlaylistSongsResponse!
    getFeedPlaylists: UserPlaylistsResponse!
    searchPlaylist(payload: SearchPayload!): UserPlaylistsResponse!
`  