import {JSX} from 'react';
import {Link} from 'react-router-dom';
import {Company} from '../../api/entities/company';
import {CompaniesChildViewProps} from './companiesChildViewProps';

/*
 * Render the companies view on a mobile browser
 */
export function CompaniesMobileChildView(props: CompaniesChildViewProps): JSX.Element {

    /*
     * Render a single company item
     */
    function renderItem(company: Company): JSX.Element {

        return (
            <div key={company.id}>
                <div className='grid grid-cols-12 mt-10'>
                    <div className='col-span-6'>
                        <Link to={`/companies/${company.id}`} className='text-blue-600 underline'>
                            {`Company ${company.id}`}
                        </Link>
                    </div>
                    <div className='col-span-6 font-bold'>
                        {company.region}
                    </div>
                </div>
                <div className='grid grid-cols-12 mt-10'>
                    <div className='col-span-6'>
                        Target USD
                    </div>
                    <div className='col-span-6 text-green-700 font-bold'>
                        {Number(company.targetUsd).toLocaleString()}
                    </div>
                </div>
                <div className='grid grid-cols-12 mt-10'>
                    <div className='col-span-6'>
                        Investment USD
                    </div>
                    <div className='col-span-6 text-green-700 font-bold'>
                        {Number(company.investmentUsd).toLocaleString()}
                    </div>
                </div>
                <div className='grid grid-cols-12 mt-10'>
                    <div className='col-span-6'>
                        # Investors
                    </div>
                    <div className='col-span-6 font-bold'>
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
        <div className='bg-white rounded shadow-sm'>
            <div className='grid grid-cols-12 border-b px-4 py-3'>
                <div className='col-span-12 text-center mx-auto font-bold'>
                    Company List
                </div>
            </div>
            <div className='card-body'>
                {props.companies.map((company) => renderItem(company))}
            </div>
        </div>
    );
}
