import { useRouter } from 'next/router';
import AddLocation from 'src/components/dashboard/AddLocation';
import BusinessSettings from 'src/components/dashboard/BusinessSettings';

export default function AddBusinessLocation({ username, busniessType }: any) {
  const router = useRouter();
  const businessId = router.query.id;

  return <BusinessSettings username={username} businessId={businessId} />;
}
