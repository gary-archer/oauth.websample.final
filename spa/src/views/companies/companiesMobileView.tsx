import React from 'react';
import {Company} from '../../api/entities/company';
import {CompaniesViewProps} from './companiesViewProps';

/*
 * Render the companies view for the mobile case
 */
export class CompaniesMobileView extends React.Component<CompaniesViewProps> {

    public constructor(props: CompaniesViewProps) {
        super(props);
    }

    /*
     * Render according to the current state
     */
    public render(): React.ReactNode {

        return  (
            <div className='card border-0'>
                <div className='card-header row'>
                    <div className='col-12 text-center mx-auto font-weight-bold'>
                        Company List
                    </div>
                </div>
                <div className='card-body'>
                    {this.props.companies.map((company) => this._renderItem(company))}
                </div>
            </div>
        );
    }

    /*
     * Render a single company on a mobile device
     */
    private _renderItem(company: Company): React.ReactNode {

        return (
            <div key={company.id}>
                <div className='row imageRow'>
                    <div className='col-2 my-auto'>
                        <img src={`images/${company.id}.svg`}/>
                    </div>
                    <div className='col-4' />
                    <div className='col-6 my-auto h4'>
                        <a href={`#/company=${company.id}`}>
                            {company.name}
                        </a>
                    </div>
                </div>
                <div className='row mobileRow'>
                    <div className='col-6'>
                        Target USD
                    </div>
                    <div className='col-6 highlightcolor font-weight-bold'>
                        {Number(company.targetUsd).toLocaleString()}
                    </div>
                </div>
                <div className='row mobileRow'>
                    <div className='col-6'>
                        Investment USD
                    </div>
                    <div className='col-6 highlightcolor font-weight-bold'>
                        {Number(company.investmentUsd).toLocaleString()}
                    </div>
                </div>
                <div className='row mobileRow'>
                    <div className='col-6'>
                        # Investors
                    </div>
                    <div className='col-6 font-weight-bold'>
                        {company.noInvestors}
                    </div>
                </div>
                <hr/>
            </div>
        );
    }
}
