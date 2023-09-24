import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import withAuth from 'src/HOCs/withAuth';
import img1 from './logo1.png';

const Digital: NextPage = ({ shopId }: any) => {
  return (
    <AdminLayout shopId={shopId}>
      <div className="page-content-style justfy-center">
        <Image src={img1} alt={'logo'} />
        <h2>Poslix @poslix.com</h2>
        <p>@poslix</p>
        <p>Pos, ecommirce, and more</p>
        <div className="digital-big-btn">
          <Link className="digital-big-btn-link" href={`/shop/${shopId}/digital/products`}>
            <span>View Products</span>
          </Link>
        </div>
        <div className="digital-socials">
          <FontAwesomeIcon className="icon-clicable" icon={faWhatsapp} />
          <FontAwesomeIcon className="icon-clicable" icon={faInstagram} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAuth(Digital);

export async function getServerSideProps(context: any) {
  return {
    props: {
      shopId: context.query.id,
      rules: { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true },
    },
  };
}
