import React from 'react';
import {Link} from 'react-router-dom';
import {Company} from '../../api/entities/company';
import {CompaniesViewProps} from './companiesViewProps';

/*
 * Render the companies view on a mobile browser
 */
export function CompaniesMobileView(props: CompaniesViewProps): JSX.Element {

    /*
     * Render a single company item
     */
    function renderItem(company: Company): JSX.Element {

        return (
            <div key={company.id}>
                <div className='row mobileHeaderRow'>
                    <div className='col-6 h4'>
                        <Link to={`/companies/${company.id}`}>
                            {`Company ${company.id}`}
                        </Link>
                    </div>
                    <div className='col-6 h4 fw-bold'>
                        {company.region}
                    </div>
                </div>
                <div className='row mobileRow'>
                    <div className='col-6'>
                        Target USD
                    </div>
                    <div className='col-6 highlightcolor fw-bold'>
                        {Number(company.targetUsd).toLocaleString()}
                    </div>
                </div>
                <div className='row mobileRow'>
                    <div className='col-6'>
                        Investment USD
                    </div>
                    <div className='col-6 highlightcolor fw-bold'>
                        {Number(company.investmentUsd).toLocaleString()}
                    </div>
                </div>
                <div className='row mobileRow'>
                    <div className='col-6'>
                        # Investors
                    </div>
                    <div className='col-6 fw-bold'>
                        {company.noInvestors}
                    </div>
                </div>
                <hr/>
            </div>
        );
    }

    /*
     * Render the collection of items
     */
    return  (
        <div className='card border-0'>
            <div className='card-header row'>
                <div className='col-12 text-center mx-auto fw-bold'>
                    Company List
                </div>
            </div>
            <div className='card-body'>
                {props.companies.map((company) => renderItem(company))}
            </div>
        </div>
    );
}
