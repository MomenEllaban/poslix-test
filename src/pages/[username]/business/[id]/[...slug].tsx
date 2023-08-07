import AddLocation from 'src/components/dashboard/AddLocation';
import BusinessSettings from 'src/components/dashboard/BusinessSettings';
import { getMyShopId, getmyUsername } from 'src/libs/loginlib';
import { ROUTES } from 'src/utils/app-routes';

const Locations = ({ username, businessId, pageType }: any) => {
  if (!username || !businessId || !pageType) return null;
  if (pageType != 'add' && pageType != 'settings') return null;

  if (pageType == 'add' && !businessId) return null;
  if (pageType == 'add' && !username) return null;

  if (pageType == 'settings' && !businessId) return null;
  if (pageType == 'settings' && !username) return null;
  console.log(pageType);
  if (pageType === 'settings')
    return <BusinessSettings username={username} businessId={businessId} />;
  if (pageType === 'add') return <AddLocation username={username} businessId={businessId} />;
  return null;
};
export default Locations;

export function getServerSideProps(context: any) {
  let okUsername = true,
    okBusinessId = true,
    okSlug = true;

  let username = getmyUsername(context.query);
  if (username == undefined || username == '0') okUsername = false;

  let businessId = getMyShopId(context.query);
  if (businessId == undefined || businessId == 0) okBusinessId = false;

  let pageType = '';
  if (context.query.slug.length > 0) pageType = context.query.slug[0];

  if (pageType != 'add' && pageType != 'settings') okSlug = false;

  if (!okUsername || !okBusinessId || !okSlug)
    return { redirect: { permanent: false, destination: ROUTES.AUTH } };

  return {
    props: { username, businessId, pageType },
  };
}
