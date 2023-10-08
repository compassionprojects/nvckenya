import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import classnames from 'classnames';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import requestIp from 'request-ip';
import format from 'date-fns/format';
import marked from '../lib/marked';

import Nav from '../components/Nav';
import RegistrationForm from '../components/RegistrationForm';

// @todo may be rename DOMAIN_HOST to BASE_URL

export async function getServerData({ headers }) {
  try {
    const IP_API_URL = 'http://ip-api.com/json/';
    const clientIp = requestIp.getClientIp({ headers });
    const { data } = await axios.get(IP_API_URL + clientIp);
    if (data.status === 'fail') throw new Error(data.message);
    return { props: data.countryCode, status: 200 };
  } catch (error) {
    console.log(error.toString());
    return {
      props: { country: '', status: 200 },
    };
  }
}

// get the latest retreat by sorting latest
export const query = graphql`
  query {
    allRetreatsYaml(sort: { start_date: ASC }) {
      edges {
        node {
          intro
          title
          contact_email
          start_date
          end_date
          city
          hero_image {
            childImageSharp {
              gatsbyImageData(width: 800)
            }
          }
          program {
            introduction
            goals
            pricing
            cancellation_policy
            accommodation_details
            accommodation_photo {
              childImageSharp {
                gatsbyImageData(width: 700)
              }
            }
            facilities
            location
            trainers_intro
            trainers
            organisers
            travel
          }
          registration {
            text
            terms_url
          }
          tiers {
            title
            price
            parity_price
            start_date
            end_date
            price_accommodation
          }
          currency {
            short_name
            symbol
          }
          seo {
            seo_title
            seo_description
            seo_image {
              publicURL
            }
          }
          sliding_scale {
            min
            max
            step
            intro
          }
          scholarship_info
          payment_options {
            bank_transfer
            mobile_money_transfer
          }
        }
      }
    }
    allTeamYaml {
      edges {
        node {
          user_id
          title
          bio
          role
          photo {
            childImageSharp {
              gatsbyImageData(width: 150, height: 150, layout: FIXED)
            }
          }
        }
      }
    }
    site {
      host
      siteMetadata {
        siteUrl
      }
    }
  }
`;

export default function Home({ data, serverData }) {
  // display the latest retreat
  const {
    title,
    intro,
    contact_email,
    hero_image,
    program,
    start_date,
    end_date,
    city,
    registration,
    tiers,
    sliding_scale,
    scholarship_info,
    payment_options,
    currency,
  } = data.allRetreatsYaml.edges[0].node;
  const people = data.allTeamYaml.edges.map((e) => e.node);
  const trainers = people.filter((p) => program.trainers.includes(p.user_id));
  const organisers = people.filter((p) =>
    program.organisers.includes(p.user_id),
  );

  const [person, setPerson] = useState({});
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const onPersonClick = (p) => () => {
    toggle();
    setPerson(p);
  };

  const dates = getDates(start_date, end_date);

  return (
    <>
      {/* Hero section */}
      <div className="px-2 py-5 mt-5 text-center border-bottom">
        <div className="col-lg-6 mx-auto">
          <h1 className="display-4 fw-bold text-body-emphasis">{title}</h1>
          <p className="lead my-4">{intro}</p>
          <div className="my-4">
            <strong>
              {dates}, {city}
            </strong>
          </div>
          <div className="mb-5 mt-3">
            <Register />
          </div>
        </div>
        <div style={{ maxHeight: '30vh' }}>
          <div className="container px-lg-5 mb-4">
            <GatsbyImage
              image={getImage(hero_image)}
              imgClassName="img-fluid rounded-3"
              className="mb-4 shadow-lg rounded-3"
              alt="The NVC community of Kenya standing in a group"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Nav />

      {/* Modal window */}
      <Modal isOpen={modal} toggle={toggle} centered size="lg">
        <ModalHeader toggle={toggle}>{person.title}</ModalHeader>
        <ModalBody>
          <p>
            <em>{person.role}</em>
          </p>
          <div
            dangerouslySetInnerHTML={{
              __html: marked(person.bio || ''),
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Page content */}
      <div
        data-bs-spy="scroll"
        data-bs-target="#navbar"
        data-bs-root-margin="0px 0px -40%"
        data-bs-smooth-scroll="false">
        <Section id="program">
          <h1 className="text-center fw-bold">Program</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked(program.introduction),
              }}
            />
          </div>
          <div className="col-lg-6 mx-auto my-5">
            <h2 className="text-center">Goals</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: marked(program.goals),
              }}
            />
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Team */}
        <Section id="team">
          <h1 className="text-center fw-bold">Team</h1>
          <div className="col-lg-5 mx-auto text-center mt-3 mb-4">
            <p>{program.trainers_intro}</p>
          </div>
          <div className="col-lg-8 mx-auto my-3">
            <div className="row">
              {trainers.map((trainer) => (
                <Person
                  key={trainer.user_id}
                  data={trainer}
                  onClick={onPersonClick(trainer)}
                />
              ))}
            </div>
          </div>

          <div className="col-lg-8 mx-auto my-5">
            <h2 className="text-center">Organisers</h2>
            <div className="row mt-3">
              {organisers.map((organiser) => (
                <Person
                  key={organiser.user_id}
                  data={organiser}
                  onClick={onPersonClick(organiser)}
                />
              ))}
            </div>
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Pricing */}
        <Section id="pricing">
          <h1 className="text-center fw-bold">Pricing</h1>
          <div
            className="col-lg-6 mx-auto my-3"
            dangerouslySetInnerHTML={{ __html: marked(program.pricing) }}
          />
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Cancellations */}
        <Section id="cancellations">
          <h1 className="text-center fw-bold">
            Cancellation and refund policy
          </h1>
          <div
            className="col-lg-6 mx-auto my-3"
            dangerouslySetInnerHTML={{
              __html: marked(program.cancellation_policy),
            }}
          />
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Accommodation */}
        <Section id="accommodation">
          <h1 className="text-center fw-bold">Accommodation</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked(program.accommodation_details),
              }}
            />
          </div>
          <div className="container px-lg-5 text-center">
            <GatsbyImage
              image={getImage(program.accommodation_photo)}
              imgClassName="img-fluid rounded-3"
              className="my-4 shadow-lg rounded-3"
              alt="The NVC community of Kenya standing in a group"
            />
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 mx-md-auto my-5">
                <h2>Facilities</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked(program.facilities),
                  }}
                />
              </div>
              <div className="col-lg-5 col-md-6 mx-lg-auto my-5">
                <h2>Location</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked(program.location),
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Travel */}
        <Section id="travel">
          <h1 className="text-center fw-bold">Getting there</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked(program.travel),
              }}
            />
          </div>
        </Section>

        {/* Registrations */}
        <Section id="registrations">
          <div className="col-lg-6 col-xl-4 col-md-9 mx-auto mb-5">
            <h1 className="fw-bold text-center">Register</h1>

            <RegistrationForm
              terms_url={registration.terms_url}
              tiers={tiers}
              sliding_scale={sliding_scale}
              scholarship_info={marked(scholarship_info)}
              payment_options={payment_options}
              currency={currency}
              contact_email={contact_email}
              registration_info={marked(registration.text)}
              country={serverData.country}
            />
          </div>
        </Section>
      </div>
    </>
  );
}

Home.propTypes = {
  data: PropTypes.object,
  serverData: PropTypes.object,
};

/* eslint-disable */
export const Head = ({ data }) => {
  const { seo, city } = data.allRetreatsYaml.edges[0].node;
  const { seo_title, seo_description, seo_image } = seo;

  return (
    <>
      <html lang="en" />
      <title>{seo_title}</title>
      <meta name="description" content={seo_description} />
      <meta
        name="keywords"
        content={`event, retreat, ${city}, kenya, nonviolent communication, nvc, compassion, self care, wellbeing`}
      />
      <meta property="og:title" content={seo_title} />
      <meta property="og:description" content={seo_description} />
      <meta property="og:image" content={seo_image.publicURL} />
      <meta property="og:url" content={data.site.siteMetadata.siteUrl} />

      <body className="nvckenya" />
    </>
  );
};
/* eslint-enable */

function Section({ center, ...props }) {
  return (
    <section
      className={classnames('px-2 py-5 my-5 border-bottom', {
        'text-center': center,
      })}
      {...props}
    />
  );
}

Section.propTypes = {
  center: PropTypes.bool,
};

function Person({ data, onClick }) {
  return (
    <div className="col-xl-3 col-md-4 col-6 my-3 text-center">
      <div className="px-3">
        <GatsbyImage
          image={getImage(data.photo)}
          alt={data.title}
          imgClassName="img-fluid"
          className="mx-auto rounded-circle"
        />
      </div>
      <div className="fw-bold my-2 cursor-pointer" onClick={onClick}>
        {data.title}
      </div>
    </div>
  );
}

Person.propTypes = {
  data: PropTypes.object,
  onClick: PropTypes.func,
};

function Register() {
  return (
    <a href="#registrations" className="btn btn-primary btn-lg">
      Register
    </a>
  );
}

function getDates(start_date, end_date) {
  const start_day = format(new Date(start_date), 'do');
  const start_month = format(new Date(start_date), 'MMMM');
  const start_year = format(new Date(start_date), 'yyyy');

  const end_day = format(new Date(end_date), 'do');
  const end_month = format(new Date(end_date), 'MMMM');
  const end_year = format(new Date(end_date), 'yyyy');

  if (start_month === end_month && start_year === end_year) {
    return `${start_day} - ${end_day} ${end_month} ${end_year}`;
  } else if (start_year === end_year && start_month !== end_month) {
    return `${start_day} ${start_month} - ${end_day} ${end_month} ${end_year}`;
  } else {
    return `${start_day} ${start_month} ${start_year} - ${end_day} ${end_month} ${end_year}`;
  }
}
