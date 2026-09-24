// The business's contact and identity details, used across the whole site.
// Cloning this site for another business? Start here, then follow TEMPLATE.md.

const studio = {
  name: 'NoDa Art House',
  street: '3109 Cullman Ave',
  city: 'Charlotte',
  region: 'NC',
  postalCode: '28206',
}

export const BUSINESS = {
  name: 'Shot by Seven',
  email: 'shotbyseven777@gmail.com',
  instagramHandle: 'shotbyseven777', // without the @
  instagramUrl: 'https://instagram.com/shotbyseven777',
  siteUrl: 'https://shotbyseven.com', // no trailing slash
  galleryUrl: 'https://shotbyseven777.pic-time.com/client', // client gallery login
  studio: {
    ...studio,
    address: `${studio.street}, ${studio.city}, ${studio.region} ${studio.postalCode}`,
  },
}
