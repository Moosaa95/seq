import ApartmentDetailClient from './ApartmentDetailClient';

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApartmentDetailClient apartmentId={id} />;
}
