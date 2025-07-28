import ClientOnly from "../components/ClientOnly";
import EmptyState from "../components/EmptyState";

const PropertiesPage = async () => {
  return (
    <ClientOnly>
      <EmptyState
        title="Properties"
        subtitle="Looks like there is no properties"
      />
    </ClientOnly>
  );
};
