import React from 'react'
import { useTranslation } from 'react-i18next'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import { DocsLink } from '../../../components'

const Typography = () => {
  const { t } = useTranslation();
  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          {t('Headings')}
          <DocsLink href="https://coreui.io/docs/content/typography/" />
        </CCardHeader>
        <CCardBody>
          <p>
            {t('Documentation and examples for Bootstrap typography, including global settings, headings, body text, lists, and more.')}
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>{t('Heading')}</th>
                <th>{t('Example')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p>
                    <code className="highlighter-rouge">&lt;h1&gt;&lt;/h1&gt;</code>
                  </p>
                </td>
                <td>
                  <span className="h1">{t('h{{n}}. Bootstrap heading', { n: 1 })}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <p>
                    <code className="highlighter-rouge">&lt;h2&gt;&lt;/h2&gt;</code>
                  </p>
                </td>
                <td>
                  <span className="h2">{t('h{{n}}. Bootstrap heading', { n: 2 })}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <p>
                    <code className="highlighter-rouge">&lt;h3&gt;&lt;/h3&gt;</code>
                  </p>
                </td>
                <td>
                  <span className="h3">{t('h{{n}}. Bootstrap heading', { n: 3 })}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <p>
                    <code className="highlighter-rouge">&lt;h4&gt;&lt;/h4&gt;</code>
                  </p>
                </td>
                <td>
                  <span className="h4">{t('h{{n}}. Bootstrap heading', { n: 4 })}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <p>
                    <code className="highlighter-rouge">&lt;h5&gt;&lt;/h5&gt;</code>
                  </p>
                </td>
                <td>
                  <span className="h5">{t('h{{n}}. Bootstrap heading', { n: 5 })}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <p>
                    <code className="highlighter-rouge">&lt;h6&gt;&lt;/h6&gt;</code>
                  </p>
                </td>
                <td>
                  <span className="h6">{t('h{{n}}. Bootstrap heading', { n: 6 })}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
      <CCard className="mb-4">
        <CCardHeader>{t('Headings')}</CCardHeader>
        <CCardBody>
          <p>
            <code className="highlighter-rouge">.h1</code> {t('through')}
            <code className="highlighter-rouge">.h6</code>
            {t('classes are also available, for when you want to match the font styling of a heading but cannot use the associated HTML element.')}
          </p>
          <div className="bd-example">
            <p className="h1">{t('h{{n}}. Bootstrap heading', { n: 1 })}</p>
            <p className="h2">{t('h{{n}}. Bootstrap heading', { n: 2 })}</p>
            <p className="h3">{t('h{{n}}. Bootstrap heading', { n: 3 })}</p>
            <p className="h4">{t('h{{n}}. Bootstrap heading', { n: 4 })}</p>
            <p className="h5">{t('h{{n}}. Bootstrap heading', { n: 5 })}</p>
            <p className="h6">{t('h{{n}}. Bootstrap heading', { n: 6 })}</p>
          </div>
        </CCardBody>
      </CCard>
      <CCard className="mb-4">
        <div className="card-header">{t('Display headings')}</div>
        <div className="card-body">
          <p>
            {t('Traditional heading elements are designed to work best in the meat of your page content. When you need a heading to stand out, consider using a')} <strong>{t('display heading')}</strong>
            {t('—a larger, slightly more opinionated heading style.')}
          </p>
          <div className="bd-example bd-example-type">
            <table className="table">
              <tbody>
                <tr>
                  <td>
                    <span className="display-1">{t('Display {{n}}', { n: 1 })}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="display-2">{t('Display {{n}}', { n: 2 })}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="display-3">{t('Display {{n}}', { n: 3 })}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="display-4">{t('Display {{n}}', { n: 4 })}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CCard>
      <CCard className="mb-4">
        <CCardHeader>{t('Inline text elements')}</CCardHeader>
        <CCardBody>
          <p>
            {t('Traditional heading elements are designed to work best in the meat of your page content. When you need a heading to stand out, consider using a')} <strong>{t('display heading')}</strong>
            {t('—a larger, slightly more opinionated heading style.')}
          </p>
          <div className="bd-example">
            <p>
              {t('You can use the mark tag to')} <mark>{t('highlight')}</mark> {t('text.')}
            </p>
            <p>
              <del>{t('This line of text is meant to be treated as deleted text.')}</del>
            </p>
            <p>
              <s>{t('This line of text is meant to be treated as no longer accurate.')}</s>
            </p>
            <p>
              <ins>{t('This line of text is meant to be treated as an addition to the document.')}</ins>
            </p>
            <p>
              <u>{t('This line of text will render as underlined')}</u>
            </p>
            <p>
              <small>{t('This line of text is meant to be treated as fine print.')}</small>
            </p>
            <p>
              <strong>{t('This line rendered as bold text.')}</strong>
            </p>
            <p>
              <em>{t('This line rendered as italicized text.')}</em>
            </p>
          </div>
        </CCardBody>
      </CCard>
      <CCard className="mb-4">
        <CCardHeader>{t('Description list alignment')}</CCardHeader>
        <CCardBody>
          <p>
            {t('Align terms and descriptions horizontally by using our grid system’s predefined classes (or semantic mixins). For longer terms, you can optionally add a')}{' '}
            <code className="highlighter-rouge">.text-truncate</code> {t('class to truncate the text with an ellipsis.')}
          </p>
          <div className="bd-example">
            <dl className="row">
              <dt className="col-sm-3">{t('Description lists')}</dt>
              <dd className="col-sm-9">{t('A description list is perfect for defining terms.')}</dd>

              <dt className="col-sm-3">{t('Euismod')}</dt>
              <dd className="col-sm-9">
                <p>
                  {t('Vestibulum id ligula porta felis euismod semper eget lacinia odio sem nec elit.')}
                </p>
                <p>{t('Donec id elit non mi porta gravida at eget metus.')}</p>
              </dd>

              <dt className="col-sm-3">{t('Malesuada porta')}</dt>
              <dd className="col-sm-9">{t('Etiam porta sem malesuada magna mollis euismod.')}</dd>

              <dt className="col-sm-3 text-truncate">{t('Truncated term is truncated')}</dt>
              <dd className="col-sm-9">
                {t('Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.')}
              </dd>

              <dt className="col-sm-3">{t('Nesting')}</dt>
              <dd className="col-sm-9">
                <dl className="row">
                  <dt className="col-sm-4">{t('Nested definition list')}</dt>
                  <dd className="col-sm-8">
                    {t('Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc.')}
                  </dd>
                </dl>
              </dd>
            </dl>
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Typography
