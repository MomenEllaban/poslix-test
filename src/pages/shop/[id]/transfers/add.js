import { useRouter } from 'next/router';
import { AddTranseferComponent } from '../../../../components/add-transefer/add-transefer';
import { AdminLayout } from '@layout';

const Add = () => {
    const router = useRouter()
    return (
        <AdminLayout shopId={router.query.id}>
            <AddTranseferComponent />
        </AdminLayout>
    );
}

export default Add;
