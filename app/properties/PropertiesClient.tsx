"use client";
import { Listing, User } from "@prisma/client";
import Container from "../components/Container";
import Heading from "../components/Heading";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import ListingCard from "../components/listings/ListingCard";
interface PropertiesProps {
  listings: Listing[];
  currentUser?: User | null;
}

const Properties: React.FC<PropertiesProps> = ({ listings, currentUser }) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);
      axios
        .delete(`/api/listings/${id}`)
        .then(() => {
          toast.success("Properties deleted");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error || "Something went wrong");
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router],
  );
  return (
    <Container>
      <Heading title="Properties" subtitle="List of your properties" />
      <div
        className="
                mt-10
                grid
                grid-cols-1
                sm:grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
                2xl:grid-cols-6
                gap-8
            "
      >
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            data={listing}
            listing={listing}
            actionId={listing.id}
            onAction={onCancel}
            disabled={deletingId === listing.id}
            actionLabel="delete listing"
            currentUser={currentUser}
          />
        ))}
      </div>
    </Container>
  );
};

export default Properties;
