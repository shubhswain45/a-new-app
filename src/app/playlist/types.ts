export const types = `#graphql
# schema/playlist.graphql
# schema/playlist.graphql

type Playlist {
  id: ID!
  name: String!
  coverImageUrl: String!
  visibility: Visibility!
  author: User!
  tracks: [Track!]!
}

type UserPlaylistsResponse {
  playlists: [UserPlaylistsResponseItem!]
}

type UserPlaylistsResponseItem {
  id: ID!
  name: String!
  coverImageUrl: String!
  totalTracks: Int!
  author: User!
}

type getPlaylistSongsResponse {
  id: String!
  title: String!
  coverImageUrl: String!
  tracks: [Track]
}

input CreatePlaylistInput {
  name: String!
  coverImageUrl: String!
  visibility: Visibility!
  trackIds: [String!]!
}
    
input AddSongToPlaylistInput {
  isNewPlaylist: Boolean!
  name: String
  existingPlaylistId: String
  coverImageUrl: String
  visibility: Visibility
  trackIds: [String!]!
}

input RemoveSongFromPlaylistInput {
  playlistId: String!
  trackId: String!
}

enum Visibility {
  PUBLIC
  PRIVATE
}
`;
