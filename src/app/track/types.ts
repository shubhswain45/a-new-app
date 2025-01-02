export const types = `#graphql
# Input type for creating a new post
input createTrackPayload {
    title: String!
    audioFileUrl: String!      
    coverImageUrl: String
    artist: String
    duration: String!
}

type Track {
  id: ID!                    # Unique identifier
  title: String!             # Track title
  artist: String!            # Name of the artist or band
  duration: String!             # Duration of the track in seconds
  coverImageUrl: String      # URL to the cover image (optional)
  audioFileUrl: String!      # URL to the audio file
  createdAt: String!         # When the track was added
  updatedAt: String!         # Automatically updated on change
  hasLiked: Boolean!
  
  author: User
}

input SearchPayload {
  query: String!
  page: Int!
}
`
