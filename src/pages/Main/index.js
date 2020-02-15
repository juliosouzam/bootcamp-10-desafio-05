import React from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List, InputGroup } from './styles';

export default class Main extends React.Component {
  state = {
    repository: '',
    repositories: [],
    loading: false,
    error: false,
    errorMessage: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleSubmit = async e => {
    try {
      e.preventDefault();
      const { repository, repositories } = this.state;
      this.setState({ loading: true });

      if (repositories.find(repo => repo.name === repository)) {
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`/repos/${repository}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        repository: '',
        loading: false,
        error: false,
        errorMessage: '',
      });
    } catch (error) {
      this.setState({
        error: true,
        loading: false,
        errorMessage: error.message,
      });
    }
  };

  handleInputChange = e => {
    this.setState({ repository: e.target.value });
  };

  render() {
    const {
      repository,
      repositories,
      loading,
      error,
      errorMessage,
    } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositories
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <InputGroup error={error}>
            <input
              type="text"
              value={repository}
              onChange={this.handleInputChange}
              placeholder="Adicionar repositório"
            />

            <span>{errorMessage}</span>
          </InputGroup>

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repo => (
            <li key={repo.name}>
              <span>{repo.name}</span>
              <Link to={`/repository/${encodeURIComponent(repo.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
