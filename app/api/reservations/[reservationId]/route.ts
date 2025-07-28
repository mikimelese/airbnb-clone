import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  reservationId?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { reservationId } = await params;

  if (!reservationId || typeof reservationId !== "string") {
    throw new Error("Invalid ID");
  }

  // Get the reservation and include the listing's owner
  const reservation = await prisma.reservation.findUnique({
    where: { id: parseInt(reservationId) },
    include: { listing: true },
  });

  if (
    !reservation ||
    (reservation.userId !== currentUser.id &&
      reservation.listing.userId !== currentUser.id)
  ) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Now it's safe to delete
  const deletedReservation = await prisma.reservation.delete({
    where: { id: parseInt(reservationId) },
  });

  return NextResponse.json(deletedReservation);
}
