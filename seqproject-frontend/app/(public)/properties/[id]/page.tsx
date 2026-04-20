import PropertyDetailClient from './PropertyDetailClient';

export default async function PropertyDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <PropertyDetailClient propertyId={id} />;
}
