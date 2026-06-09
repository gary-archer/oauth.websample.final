import {JSX} from 'react';
import {Link} from 'react-router-dom';
import {Company} from '../../api/entities/company';
import {CompaniesChildViewProps} from './companiesChildViewProps';

/*
 * Render the companies data on a desktop browser
 */
export function CompaniesDesktopChildView(props: CompaniesChildViewProps): JSX.Element {

    /*
     * Render a single item
     */
    function renderItem(company: Company): JSX.Element {

        return (
            <div className='grid grid-cols-12 mt-10' key={company.id}>
                <div className='col-span-2 my-auto text-center'>
                    {company.name}
                </div>
                <div className='col-span-2 my-auto text-center'>
                    {company.region}
                </div>
                <div className='col-span-2 my-auto text-center'>
                    <Link to={`/companies/${company.id}`} className='text-blue-600 underline'>
                        View Transactions
                    </Link>
                </div>
                <div className='col-span-2 my-auto text-green-700 font-bold text-right'>
                    {Number(company.targetUsd).toLocaleString()}
                </div>
                <div className='col-span-2 my-auto text-green-700 font-bold text-right'>
                    {Number(company.investmentUsd).toLocaleString()}
                </div>
                <div className='col-span-2 my-auto font-bold text-right'>
                    {company.noInvestors}
                </div>
            </div>
        );
    }

    /*
     * Render the collection of items
     */
    return  (
        <div className='bg-white rounded shadow-sm'>
            <div className='grid grid-cols-12 border-b px-4 py-3'>
                <div className='col-span-2 font-bold text-center'>Account</div>
                <div className='col-span-2 font-bold text-center'>Region</div>
                <div className='col-span-2' />
                <div className='col-span-2 font-bold text-right'>Target USD</div>
                <div className='col-span-2 font-bold text-right'>Investment USD</div>
                <div className='col-span-2 font-bold text-right'># Investors</div>
            </div>
            <div className='card-body'>
                {props.companies.map((company) => renderItem(company))}
            </div>
        </div>
    );
}
