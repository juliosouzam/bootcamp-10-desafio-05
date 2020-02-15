import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';

import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  ButtonGroup,
  Button,
  Pagination,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    state: 'all',
    repoName: '',
    per_page: 5,
    page: 1,
    loading: true,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const { state, page, per_page } = this.state;

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          page,
          per_page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      repoName,
    });
  }

  handleGetPaginate = async page => {
    const { repoName, state, per_page } = this.state;

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        page,
        per_page,
      },
    });

    this.setState({
      issues: response.data,
      page,
    });
  };

  handleGetIssues = async state => {
    const { repoName, page, per_page } = this.state;

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        page,
        per_page,
      },
    });

    this.setState({
      issues: response.data,
      state,
    });
  };

  render() {
    const { repository, issues, loading, state, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <ButtonGroup>
          <Button
            focus={state === 'all'}
            onClick={() => this.handleGetIssues('all')}
          >
            All
          </Button>
          <Button
            focus={state === 'open'}
            onClick={() => this.handleGetIssues('open')}
          >
            Open
          </Button>
          <Button
            focus={state === 'closed'}
            onClick={() => this.handleGetIssues('closed')}
          >
            Closed
          </Button>
        </ButtonGroup>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <span>{page}</span>
        <Pagination>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => this.handleGetPaginate(page - 1)}
          >
            <FaArrowAltCircleLeft color="#7159c1" size={24} />
          </button>
          <button
            type="button"
            onClick={() => this.handleGetPaginate(page + 1)}
          >
            <FaArrowAltCircleRight color="#7159c1" size={24} />
          </button>
        </Pagination>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
