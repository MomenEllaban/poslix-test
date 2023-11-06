import { ICustomer } from '@models/pos.types';
import { Col, Container, Row } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';

interface IProps {
  customer: Partial<ICustomer>;
}

const dataBar = {
  labels: ['Paid', 'Unpaid', 'Partial', 'Canceled', 'Draft'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
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

export default function CustomerProfileView({ customer }: IProps) {
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
                  <h5>Last login</h5>
                </div>
              </div>
            </Col>
            <Col md={5}>
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">Total Quotations</h6>
                  <h5>0</h5>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col xs={12}>
              <div className="card">
                <div className="card-body">
                  <h5>Profile Info</h5>
                  <Container fluid>
                    <Row>
                      <Col xs={12}>
                        <h6 className="d-inline-block">First Name:</h6> {customer.first_name}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">Last Name:</h6> {customer.last_name}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">City:</h6> {customer.city}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">State:</h6> {customer.state}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">Address 1:</h6> {customer.address_line_1}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">Address 2:</h6> {customer.address_line_2}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">zip_code:</h6> {customer.zip_code}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">country:</h6> {customer.country}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">shipping_address:</h6>{' '}
                        {customer.shipping_address}
                      </Col>
                      <Col xs={12}>
                        <h6 className="d-inline-block">Group:</h6>{' '}
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
                  <h6 className="mb-3">Total Eranings</h6>
                  <h5>50</h5>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">Due Invoices</h6>
                  <h5>1</h5>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <div className="card">
              <div className="card-body">
                <h1>Invoices</h1>
                <div className="loc-dash-big-chart w-100">
                  <div>
                    <Pie
                      data={dataBar}
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
