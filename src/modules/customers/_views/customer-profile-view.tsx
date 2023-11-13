import { ICustomer } from '@models/pos.types';
import { Col, Container, Row } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'next-i18next';

interface IProps {
  customer: Partial<ICustomer>;
  earnings: any;
  invoices: any;
  totalQuotations: number;
}

const dataBar = (t: any, paid:number, unpaid:number, partial:number, canceled:number,draft:number=1) => ({
  labels: [t('customer.paid'), t('customer.unpaid'), t('customer.partial'), t('customer.canceled'), t('customer.draft')],
  datasets: [
    {
      label: '# of Votes',
      data: [paid, unpaid, partial, canceled, draft],
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
});

export default function CustomerProfileView({ customer, earnings, invoices, totalQuotations }: IProps) {
  const { t } = useTranslation();
  const { duo, paid, unpaid, canceled } = invoices;
  console.log(customer);
  
  return (
    <Container fluid>
      <Row>
        <Col md={7}>
          <Row>
            <Col md={7}>
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">
                    {customer.first_name} {customer.last_name}
                  </h6>
                  <h5>{t('customer.last_login')}</h5>
                </div>
              </div>
            </Col>
            <Col md={5}>
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">{t('customer.total_quotations')}</h6>
                  <h5>{totalQuotations}</h5>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col xs={12}>
              <div className="card">
                <div className="card-body">
                  <h5>{t('customer.profile_info')}</h5>
                  <Container fluid>
                    <Row>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.first_name')}:</h6> {customer.first_name}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.last_name')}:</h6> {customer.last_name}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.city')}:</h6> {customer.city}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.state')}:</h6> {customer.state}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.address')} 1:</h6> {customer.address_line_1}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.address')} 2:</h6> {customer.address_line_2}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.zip')}:</h6> {customer.zip_code}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.country')}:</h6> {customer.country}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.shipping_address')}:</h6>{' '}
                        {customer.shipping_address}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">{t('customer.group')}:</h6>{' '}
                        {customer?.pricing_group?.name}
                      </Col>
                    </Row>
                  </Container>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col md={5}>
          <Row>
            <Col md={6}>
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">{t('customer.total_earning')}</h6>
                  <h5>{earnings.total}</h5>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">{t('customer.due_invoices')}</h6>
                  <h5>{duo}</h5>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <div className="card">
              <div className="card-body">
                <h1>{t('customer.invoices')}</h1>
                <div className="loc-dash-big-chart w-100">
                  <div>
                    <Pie
                      data={dataBar(t, duo, paid, unpaid, canceled)}
                      width={600}
                      height={230}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
