export default async (req, { geo }) => {
  console.log('am here');
  return Response.json({ country: geo?.country?.code });
};

export const config = { path: '/api/get_country' };
