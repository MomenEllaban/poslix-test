import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import withAuth from 'src/HOCs/withAuth';
import img1 from './logo1.png';
import { useRouter } from 'next/router';
import { findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';

const Digital: NextPage = ({ shopId }: any) => {
  const router = useRouter();
  const [appearance, setAppearance] = useState<any>();
  const [loading, setLoading] = useState<any>(false);

  // ----------------------------------------------------------------------------------------------
  const fetchApperance = async () => {
    setLoading(true);
    try {
      const res = await findAllData(`appearance/${router.query.id}`);
      setAppearance(res.data.result);
    } catch (err) {
      Toastify('error', 'Something went wrong with getting Apperance, please try again later!');
    }
    setLoading(false);
  };
  console.log(appearance);

  // ----------------------------------------------------------------------------------------------
  useEffect(() => {
    fetchApperance();
  }, []);
  return (
    <div>
      <div className="page-content-style justfy-center">
        {
          loading ? (
            <Spinner />
          ) : (
            // appearance?.en?.logo ?
            <Image
              src={appearance?.en?.logo}
              alt={'logo'}
              style={{ maxHeight: '33vh' }}
              width={300}
              height={200}
            />
          )
          // <Image src={img1} alt={'logo'} />
        }
        <h2>Poslix @poslix.com</h2>
        {/* <p>@poslix</p> */}
        <a
          style={{ color: '#000', textDecoration: 'none' }}
          target="_blank"
          href={appearance?.en?.website}
          rel="noopener noreferrer">
          {appearance?.en?.website}
        </a>

        {/* <p><a href={`mailto:${appearance?.en?.website}`}>{appearance?.en?.website}</a></p> */}
        <p>Pos, ecommirce, and more</p>
        <div className="digital-big-btn">
          <Link className="digital-big-btn-link" href={`/shop/${shopId}/digital/products`}>
            <span>View Products</span>
          </Link>
        </div>
        <div className="digital-socials">
          <a
            style={{ color: '#000', textDecoration: 'none' }}
            target="_blank"
            href={appearance?.en?.whatsapp}
            rel="noopener noreferrer">
            <FontAwesomeIcon className="icon-clicable" icon={faWhatsapp} />
          </a>
          <a
            style={{ color: '#000', textDecoration: 'none' }}
            target="_blank"
            href={appearance?.en?.instagram}
            rel="noopener noreferrer">
            <FontAwesomeIcon className="icon-clicable" icon={faInstagram} />
          </a>
        </div>
      </div>
    </div>
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
