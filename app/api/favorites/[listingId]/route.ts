import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function POST(request: Request, context: { params: IParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = await context.params;

  const numericListingId = parseInt(listingId || "", 10);

  if (isNaN(numericListingId)) {
    throw new Error("Invalid ID");
  }

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  // let favoriteIds = [...(currentUser.favoriteIds || [])];

  // favoriteIds.push(listingId);

  const user = await prisma.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      favoriteIds: {
        push: listingId,
      },
    },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = await params;

  const numericListingId = parseInt(listingId || "", 10);

  if (isNaN(numericListingId)) {
    throw new Error("Invalid ID");
  }

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  let favoriteId = [...(currentUser.favoriteIds || [])];

  favoriteId = favoriteId.filter((id) => id !== listingId);

  const user = await prisma.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      favoriteIds: {
        set: favoriteId,
      },
    },
  });

  return NextResponse.json(user);
}
