export const mutations = `#graphql
    createPlaylist(payload: CreatePlaylistInput!): Boolean!
    addSongToPlaylist(payload: AddSongToPlaylistInput!): Boolean!
    removeSongFromPlaylist(payload: RemoveSongFromPlaylistInput!): Boolean!
` 