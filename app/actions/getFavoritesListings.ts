import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export default async function getReservations() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    // const favoriteIds = currentUser.favoriteIds;
    const favoriteIdss = (currentUser.favoriteIds || []).map((id: string) =>
      parseInt(id, 10),
    );
    const favoriteIds = await prisma.listing.findMany({
      where: {
        id: {
          in: favoriteIdss,
        },
      },
    });

    return favoriteIds;
  } catch (error: any) {
    throw new Error(error);
  }
}
