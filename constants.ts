import { User, Post } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex D.',
  handle: '@alex_core',
  avatar: 'https://picsum.photos/200/200?random=1',
};

export const PARTNER_USER: User = {
  id: 'u2',
  name: 'Jordan K.',
  handle: '@jordan_flux',
  avatar: 'https://picsum.photos/200/200?random=2',
  isPartner: true,
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  PARTNER_USER,
  {
    id: 'u3',
    name: 'Satoshi N.',
    handle: '@origin_0',
    avatar: 'https://picsum.photos/200/200?random=3',
  },
  {
    id: 'u4',
    name: 'Mina V.',
    handle: '@void_walker',
    avatar: 'https://picsum.photos/200/200?random=4',
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    content: 'Reality is merely an illusion, albeit a very persistent one. Captured this texture today.',
    image: 'https://picsum.photos/800/600?random=10',
    likes: 124,
    timestamp: '2h ago',
    type: 'moment',
  },
  {
    id: 'p2',
    userId: 'u3',
    content: 'The block is mining. Consensus reached.',
    likes: 89,
    timestamp: '5h ago',
    type: 'thought',
  },
  {
    id: 'p3',
    userId: 'u4',
    content: 'Do you remember the sound of the rain in Tokyo?',
    image: 'https://picsum.photos/800/800?random=12',
    likes: 245,
    timestamp: '1d ago',
    type: 'memory',
  },
];