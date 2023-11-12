import { useRouter } from 'next/router';
import { AddTranseferComponent } from '../../../../components/add-transefer/add-transefer';
import { AdminLayout } from '@layout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Add = () => {
    const router = useRouter()
    return (
        <AdminLayout shopId={router.query.id}>
            <AddTranseferComponent />
        </AdminLayout>
    );
}

export default Add;
export async function getServerSideProps({ locale}) {
    return {
      props: {  
              ...(await serverSideTranslations(locale))
      },
    };
  }