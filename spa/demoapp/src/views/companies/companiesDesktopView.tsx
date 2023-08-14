import React from 'react';
import {Link} from 'react-router-dom';
import {Company} from '../../api/entities/company';
import {CompaniesViewProps} from './companiesViewProps';

/*
 * Render the companies view on a desktop browser
 */
export function CompaniesDesktopView(props: CompaniesViewProps): JSX.Element {

    /*
     * Render a single item
     */
    function renderItem(company: Company): JSX.Element {

        return (
            <div className='row listRow' key={company.id}>
                <div className='col-2 my-auto text-center'>
                    {company.name}
                </div>
                <div className='col-2 my-auto text-center'>
                    {company.region}
                </div>
                <div className='col-2 my-auto text-center'>
                    <Link to={`/companies/${company.id}`}>
                        View Transactions
                    </Link>
                </div>
                <div className='col-2 my-auto highlightcolor fw-bold text-end'>
                    {Number(company.targetUsd).toLocaleString()}
                </div>
                <div className='col-2 my-auto highlightcolor fw-bold text-end'>
                    {Number(company.investmentUsd).toLocaleString()}
                </div>
                <div className='col-2 my-auto fw-bold text-end'>
                    {company.noInvestors}
                </div>
            </div>
        );
    }

    /*
     * Render the collection of items
     */
    return  (
        <div className='card border-0'>
            <div className='row card-header'>
                <div className='col-2 fw-bold text-center'>Account</div>
                <div className='col-2 fw-bold text-center'>Region</div>
                <div className='col-2' />
                <div className='col-2 fw-bold text-end'>Target USD</div>
                <div className='col-2 fw-bold text-end'>Investment USD</div>
                <div className='col-2 fw-bold text-end'># Investors</div>
            </div>
            <div className='card-body'>
                {props.companies.map((company) => renderItem(company))}
            </div>
        </div>
    );
}
