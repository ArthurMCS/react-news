import { GetStaticProps } from 'next';
import { ReactElement, useState } from 'react';
import Link from 'next/link';
import { AiOutlineCalendar } from 'react-icons/ai';
import { IoPersonOutline } from 'react-icons/io5';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  id: string;
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  const handleFetchNextPage = async (): Promise<void> => {
    const response = await fetch(next_page);
    const nextPagePosts = await response.json();
    setPosts([...posts, ...nextPagePosts.results]);
    setNextPage(nextPagePosts.next_page);
  };

  return (
    <>
      <main className={styles.container}>
        <img src="/images/Logo.svg" alt="logo" />

        <section className={styles.previews}>
          {posts.map(post => (
            <Link key={post.id} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <AiOutlineCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <span>
                    <IoPersonOutline />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </section>

        {nextPage && (
          <button type="button" onClick={handleFetchNextPage}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    lang: 'pt-BR',
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 60 * 10, // 10 minutes
  };
};
