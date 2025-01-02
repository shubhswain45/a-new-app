import { Track } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { v2 as cloudinary } from 'cloudinary';
import { GraphqlContext } from "../interfaces";

interface CreateTrackPayload {
    title: string;           // Track title, required
    audioFileUrl: string;    // URL to the audio file, required
    coverImageUrl?: string;  // URL to the cover image, optional
    artist?: string;  // URL to the cover image, optional
    duration: string
}

interface SearchTrackPayload {
    query: string; // The search query, required
    page: number;  // The page number for pagination, required
}


const queries = {
    //[1,2,3,4,5,6,7,8,9,10,11,12]
    getFeedTracks: async (parent: any, { page }: { page: number }, ctx: GraphqlContext) => {
        try {
            const userId = ctx.user?.id;

            // Fetch tracks authored by users the current user follows, directly in one query
            const tracks = await prismaClient.track.findMany({
                where: {
                    author: {
                        followers: {
                            some: { followerId: userId }, // Ensure the author is followed by the user
                        },
                    },
                },
                include: {
                    likes: userId ?
                        {
                            where: { userId }, // Check if the specific user has liked the post
                            select: { userId: true },
                        } : undefined
                },
                take: 5, // Optional: Limit to 5 tracks
                skip: (page - 1) * 5,
                orderBy: { createdAt: 'desc' }, // Optional: Order by newest
            });

            return tracks.map(track => ({
                ...track,
                hasLiked: userId ? track.likes.length > 0 : false, // Check if the likes array has the current user's like
            }));


        } catch (error) {
            console.error("Error fetching feed tracks:", error);
            throw new Error("Failed to fetch feed tracks.");
        }
    },

    getTrackById: async (
        parent: any,
        { trackId }: { trackId: string },
        ctx: GraphqlContext
    ) => {
        try {
            const userId = ctx.user?.id

            // Fetch the post along with related data
            const track = await prismaClient.track.findUnique({
                where: { id: trackId },
                include: {
                    likes: userId ?
                        {
                            where: { userId }, // Check if the specific user has liked the post
                            select: { userId: true },
                        } : undefined
                }
            });

            if (!track) {
                return null;
            }

            return {
                ...track,
                hasLiked: userId ? track.likes.length > 0 : false
            }


        } catch (error) {
            // Log the error for debugging
            console.error("Error fetching post:", error);
            throw new Error("Failed to fetch the post. Please try again.");
        }
    },

    searchTrack: async (
        parent: any,
        { payload }: { payload: SearchTrackPayload },
        ctx: GraphqlContext
    ) => {
        try {
            const { query, page } = payload
            // Perform a filtered query directly in the database
            const filteredTracks = await prismaClient.track.findMany({
                where: {
                    title: {
                        contains: query, // Matches tracks with the query string
                        mode: "insensitive", // Ensures case-insensitive matching
                    },
                },
                take: 3,
                skip: (page - 1) * 3,
            });

            return filteredTracks; // Return the matching tracks
        } catch (error) {
            // Log the error for debugging
            console.error("Error fetching tracks:", error);
            throw new Error("Failed to fetch the tracks. Please try again.");
        }
    }

};

const mutations = {
    createTrack: async (
        parent: any,
        { payload }: { payload: CreateTrackPayload },
        ctx: GraphqlContext
    ) => {
        try {
            // Ensure the user is authenticated
            if (!ctx.user) throw new Error("Please Login/Signup first!");

            const { title, audioFileUrl, coverImageUrl, artist, duration } = payload;

            // Upload audio URL to Cloudinary
            const uploadAudioResult = await cloudinary.uploader.upload(audioFileUrl, {
                resource_type: "auto",
            });

            // Upload cover image URL to Cloudinary (if provided)
            let uploadImageResult = null;
            if (coverImageUrl) {
                uploadImageResult = await cloudinary.uploader.upload(coverImageUrl, {
                    resource_type: "auto",
                });
            }

            // Create track in the database
            const track = await prismaClient.track.create({
                data: {
                    title,
                    artist,
                    duration,
                    audioFileUrl: uploadAudioResult.secure_url,
                    coverImageUrl: uploadImageResult?.secure_url || null,
                    authorId: ctx.user.id, // Link track to the authenticated user
                },
            });

            return track; // Return the created track
        } catch (error: any) {
            // Handle errors gracefully
            console.error("Error creating track:", error);
            throw new Error(error.message || "An error occurred while creating the track.");
        }
    },

    deleteTrack: async (
        parent: any,
        { trackId }: { trackId: string },
        ctx: GraphqlContext
    ) => {
        try {
            // Ensure the user is authenticated
            if (!ctx.user) throw new Error("Please Login/Signup first!");

            const track = await prismaClient.track.findUnique({ where: { id: trackId } })

            if (!track) {
                throw new Error("Post Doest exist!");
            }

            if (track.authorId.toString() != ctx.user.id.toString()) {
                throw new Error("You cant delete someone else post!");
            }

            await prismaClient.track.delete({ where: { id: trackId } })

            return true

        } catch (error: any) {
            // Handle errors gracefully (Cloudinary or Prisma issues)
            console.error("Error toggling like:", error);
            throw new Error(error.message || "An error occurred while toggling the like on the post.");
        }
    },

    likeTrack: async (parent: any, { trackId }: { trackId: string }, ctx: GraphqlContext) => {

        try {

            if (!ctx.user) throw new Error("Please Login/Signup first");

            // Attempt to delete the like (unlike the track)
            await prismaClient.like.delete({
                where: {
                    userId_trackId: {
                        userId: ctx.user.id,
                        trackId,
                    },
                },
            });
            // If successful, return false (indicating the track is now unliked)
            return false;

        } catch (error: any) {
            if (error.code === 'P2025') {
                // Create a like if not found (toggle to liked)
                await prismaClient.like.create({
                    data: {
                        userId: ctx?.user?.id || "",
                        trackId,
                    },
                });
                return true; // Indicate the track is now liked
            }

            throw new Error(error.message || "something went wrong");
        }
    },
};


const extraResolvers = {
    Track: {
        author: async (parent: Track) => await prismaClient.user.findUnique({ where: { id: parent.authorId } })
    },

}

export const resolvers = { mutations, queries, extraResolvers };