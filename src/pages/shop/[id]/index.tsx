import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import ShuffleText from 'shuffle-text';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement,
  BarElement,
  Filler,
  ChartOptions,
} from 'chart.js';
import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Toastify } from 'src/libs/allToasts';
import { ILocationSettings } from '@models/common-model';
import { Switch } from '@mui/material';
import { findAllData } from 'src/services/crud.api';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip
);

// const data22 = {
//   labels: ['Red', 'Blue', 'Yellow'],
//   datasets: [
//     {
//       data: [300, 50, 100],
//       backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
//       hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
//     },
//   ],
// };
let _locs = [];
const periods = ['daily', 'weekly', 'monthly', 'yearly'];
const Home = (props: any) => {
  const router = useRouter();
  const { t } = useTranslation();

  const { shopId } = props;
  const [period, setPeriod] = useState('weakly');
  const [dashboardData, setDashboardData] = useState<any>();
  const [upDown, setUpDown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txtP1, setTxtP1] = useState({ name: '', index: 1 });
  const [txtP2, setTxtP2] = useState({ name: '', index: 1 });
  const [txtP3, setTxtP3] = useState({ name: '', index: 1 });
  const [txtP4, setTxtP4] = useState({ name: '', index: 1 });
  const title1 = useRef(null);
  const title2 = useRef(null);
  const title3 = useRef(null);
  const title4 = useRef(null);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    // @ts-ignore
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });

  async function initData() {}
  // ----------------------------------------------------------------------------------------------
  const getDashbordData = async () => {
    setIsLoading(true);
    try {
      const res = await findAllData(
        `location-report?location_id=${router.query.id}&salesPeriod=${
          periods[txtP1?.index - 1]
        }&purchasePeriod=${periods[txtP2?.index - 1]}&expensesPeriod=${
          periods[txtP3?.index - 1]
        }&CustomerPeriod=${periods[txtP4?.index - 1]}`
      );
      console.log(res?.data?.result);
      
      setDashboardData(res?.data?.result);
    } catch (e) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    // setIsProductsLoadingloading(false)
    setIsLoading(false);
  };

  // ----------------------------------------------------------------------------------------------
  useEffect(() => {
    getDashbordData();
  }, [txtP1, txtP2, txtP3, txtP4, router.query.id]);
  // ----------------------------------------------------------------------------------------------
  useEffect(() => {
    initData();
    _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.location_id == shopId;
          })
        ]
      );

    setTxtP1({ name: getTxtTimeFrame(1), index: 1 });
    setTxtP2({ name: getTxtTimeFrame(1), index: 1 });
    setTxtP3({ name: getTxtTimeFrame(1), index: 1 });
    setTxtP4({ name: getTxtTimeFrame(1), index: 1 });
  }, []);
  function getTxtTimeFrame(p: number) {
    setPeriod(p == 1 ? 'daily' : p == 2 ? 'weekly' : p == 3 ? 'monthly' : p == 4 ? 'yearly' : '');
    if (p == 1) return 'Daily';
    else if (p == 2) return 'Weekly';
    else if (p == 3) return 'Monthly';
    else if (p == 4) return 'Yearly';
    else return 'err';
  }
  function getRightNum(p: number) {
    if (p > 4) p = 1;
    else if (p < 1) p = 4;
    return p;
  }
  const btnHandleTimeFrame = (index: number, p: number) => {
    index = getRightNum(index);
    if (p == 1) setTxtP1({ name: getTxtTimeFrame(index), index: index });
    else if (p == 2) setTxtP2({ name: getTxtTimeFrame(index), index: index });
    else if (p == 3) setTxtP3({ name: getTxtTimeFrame(index), index: index });
    else if (p == 4) setTxtP4({ name: getTxtTimeFrame(index), index: index });
  };
  useEffect(() => {
    const text = new ShuffleText(title1.current);
    text.start();
  }, [txtP1]);
  useEffect(() => {
    const text = new ShuffleText(title2.current);
    text.start();
  }, [txtP2]);
  useEffect(() => {
    const text = new ShuffleText(title3.current);
    text.start();
  }, [txtP3]);
  useEffect(() => {
    const text = new ShuffleText(title4.current);
    text.start();
  }, [txtP4]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  };
  const handleUpDown = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpDown(event.target.checked);
  };
  function getRightTime(dateTimeString: string) {
    return moment(dateTimeString).format('YYYY/MM/DD hh:mm A');
  }

  // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data_bar = {
    labels: dashboardData?.monthlySales?.map((item) => `Month ${item.month}`) || [],
    datasets: [
      {
        label: 'Monthly Sales',
        data: dashboardData?.monthlySales?.map((item) => parseFloat(item.total)) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const data_last_low = {
    labels: upDown
      ? dashboardData?.bottomProducts?.map((item) => item.product_name)
      : dashboardData?.topProducts?.map((item) => item.product_name),
    // labels: dashboardData?.topProducts?.map(item => item.product_name),
    datasets: [
      {
        label: 'TOP/Down Products',
        data: upDown
          ? dashboardData?.bottomProducts?.map((item) => parseFloat(item.transaction_count)) || []
          : dashboardData?.topProducts?.map((item) => parseFloat(item.transaction_count)) || [],
        // data: dashboardData?.topProducts?.map(item => parseFloat(item.transaction_count)) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout shopId={shopId}>
      {isLoading ? (
        <div className="centered-dev" style={{ zIndex: '2' }}>
          <Spinner />
        </div>
      ) : null}
      <div className="row loc-dash-top">
        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/sales_icon.png" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>{t('g.SALES')}</h4>
            <h5 ref={title1}>{t(`g.${txtP1.name}`)}</h5>
            <h3>
              {dashboardData?.sales}
              {/* {Number(box1Price[txtP1.index - 1]).toFixed(
                locationSettings?.location_decimal_places
              )} */}
              <span>{locationSettings?.currency_code}</span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP1.index + 1, 1)}>
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP1.index - 1, 1)}>
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>

        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/purchase_icon.png" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>{t('g.PURCHASES')}</h4>
            <h5 ref={title2}>{t(`g.${txtP1.name}`)}</h5>
            <h3>
              {dashboardData?.purchases}
              {/* {Number(box3Price[txtP2.index - 1]).toFixed(
                locationSettings?.location_decimal_places
              )} */}
              <span>{locationSettings?.currency_code}</span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP2.index + 1, 2)}>
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP2.index - 1, 2)}>
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>

        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/cash.png" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>{t('g.EXPENSES')}</h4>
            <h5 ref={title3}>{t(`g.${txtP1.name}`)}</h5>
            <h3>
              {dashboardData?.expenses}
              {/* {Number(box2Price[txtP3.index - 1]).toFixed(
                locationSettings?.location_decimal_places
              )} */}
              <span>{locationSettings?.currency_code}</span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP3.index + 1, 3)}>
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP3.index - 1, 3)}>
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>

        <div className="loc-dash-top-items">
          <div className="inner-loc-dash-top-items">
            <div className="top-cricle-dash">
              <img src="/images/dashboard/users_icon.jpg" />
            </div>
          </div>
          <div className="inner-loc-dash-top-items dash-top-items-details">
            <h4>{t('g.CUSTOMERS')}</h4>
            <h5 ref={title4}>{t(`g.${txtP1.name}`)}</h5>
            <h3>
              {dashboardData?.customers}
              {/* {Number(box4Price[txtP4.index - 1])} */}
              <span></span>
            </h3>
          </div>
          <div className="inner-loc-dash-top-items arrows-details">
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP4.index + 1, 4)}>
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div className="arrow-updown" onClick={() => btnHandleTimeFrame(txtP4.index - 1, 4)}>
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
        </div>
      </div>
      <div className="row loc-dash-top-under">
        <div className="loc-dash-big-chart">
          <h4>{t('g.MonthlySales')}</h4>
          <div>
            <Bar
              data={data_bar}
              width={400}
              height={200}
              options={{
                maintainAspectRatio: false,
                indexAxis: 'y',
              }}
            />
          </div>
        </div>
        <div className="loc-dash-small-chart">
          <h4>
            {t('g.Top_7_Products')}
            <Switch checked={upDown} onChange={handleUpDown} />
            <span>{upDown ? 'Down' : 'Up'}</span>
          </h4>
          <div>
            <Bar
              data={data_last_low}
              width={400}
              height={200}
              options={{
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
      <div className="row loc-dash-top-under">
        <div className="">
          <div className="loc-dasg-box">
            <h4>{t('g.The_last_10_invoices')}</h4>
            <div className="loc-dasg-box-content  d-flex justify-content-between flex-wrap">
              <div className="me-head-table">
                <div className="m-fileds text-start" style={{ width: '20%' }}>
                  #
                </div>
                {/* <div className="m-fileds text-start">Date</div> */}
                <div className="m-fileds text-start" style={{ width: '30%' }}>
                  {t('g.Date')}
                </div>
                <div className="m-fileds text-start" style={{ width: '25%' }}>
                  {t('g.finalTotal')}
                </div>
                <div className="m-fileds text-start" style={{ width: '25%' }}>
                  {t('g.CreatedBy')}
                </div>
              </div>
              {dashboardData?.lastInvoices?.map((itm, i: number) => {
                // console.log(itm);

                return (
                  <div key={i} className="me-tr-table">
                    <div className="m-fileds" style={{ width: '20%' }}>
                      {itm.id}
                    </div>
                    <div className="m-fileds" style={{ width: '30%' }}>
                      {getRightTime(itm.created_at)}
                    </div>
                    <div className="m-fileds" style={{ width: '25%' }}>
                      {Number(itm.total_price).toFixed(locationSettings?.location_decimal_places)}{' '}
                      {locationSettings?.currency_code}
                    </div>
                    <div className="m-fileds" style={{ width: '25%' }}>
                      {/* {_locs.find(l => l.location_id == itm.created_by
                      )?.location_name} */}
                      { itm.user && itm.user.last_name !== null
                        ? itm.user.first_name + ' ' + itm.user.last_name
                        : itm.user && itm.user.first_name !==null ? itm.user.first_name : 'Digital Menu' }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default Home;
export async function getServerSideProps(context: any) {
  const { query, locale } = context;

  if (query.id == undefined) {
    return {
      redirect: {
        permanent: false,
        destination: '/page403',
      },
    };
  }
  return {
    props: {
      shopId: query.id,
      ...(await serverSideTranslations(locale)),
    },
  };
}
