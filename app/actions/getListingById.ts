import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams) {
  try {
    const { listingId } = await params;

    if (!listingId) return null;

    const numericId = parseInt(listingId, 10);

    if (isNaN(numericId)) return null;
    const listing = await prisma.listing.findUnique({
      where: {
        id: numericId,
      },
      include: {
        user: true,
      },
    });

    if (!listing) {
      return null;
    }
    return listing;
  } catch (error: any) {
    throw new Error(error);
  }
}
