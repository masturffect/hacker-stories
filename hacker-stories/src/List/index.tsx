import React, { useState } from 'react';
import { ReactComponent as Remove } from './remove.svg';
import { ReactComponent as  Up } from './up.svg';
import { ReactComponent as  Down } from './down.svg';
import * as Styled from './styles';
import { sortBy } from 'lodash';

type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
};

type Stories = Array<Story>;

type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
};

interface StoryDictionary {
    [key: string]: any
}

const SORTS: StoryDictionary = {
    NONE: (list: Stories) => list,
    TITLE: (list: Stories) => sortBy(list, 'title'),
    AUTHOR: (list: Stories) => sortBy(list, 'author'),
    COMMENT: (list: Stories) => sortBy(list, 'num_comments').reverse(),
    POINT: (list: Stories) => sortBy(list, 'points').reverse(),
}

const List = ({list, onRemoveItem}: ListProps) => {
    const [sort, setSort] = useState({
        sortKey: 'NONE',
        isReverse: false,
    });
    const [buttonToggle, setButtonToggle] = useState([
        { label: "title", value: false},
        { label: "author", value: false},
        { label: "comments", value: false},
        { label: "points", value: false}
    ]);

    const handleSort = (sortKey: string) => {
        const isReverse = sort.sortKey === sortKey && !sort.isReverse; 
        setSort({ sortKey: sortKey, isReverse: isReverse });
    };

    const handleButtonToggle = (label: string) => {
        const newState = buttonToggle.map((button, i) => {
            let temp = buttonToggle[i].value;
            if(button.label === label){
                return (button = { label: button.label, value: !temp});
            }

            return {
                label: button.label,
                value: false
            };
        });
        setButtonToggle(newState);
    }

    const sortFunction = SORTS[sort.sortKey] ;
    const sortedList = sort.isReverse ? sortFunction(list).reverse() : sortFunction(list);

    console.log(buttonToggle[0].value);

    return(
        <div>
            <div style={{marginBottom: '30px', paddingBottom: '10px', borderBottom: '3px solid black'}}>
                <span style={{display: 'inline-block', width: '40%'}}>
                    <Styled.StyledToggleButton
                    type="button" 
                    style={ buttonToggle[0].value ? {backgroundColor: 'black', color: 'white'} : {backgroundColor: 'white', color: 'black'} } 
                    onClick={() => {handleSort('TITLE'); handleButtonToggle('title');}}
                    >
                        Title
                    </Styled.StyledToggleButton>
                    {
                        buttonToggle[0].value ?
                        <Down height="16px" width="16px" />
                        :
                        <Up height="16px" width="16px"/>
                    }
                </span>
                <span style={{display: 'inline-block', width: '30%'}}>
                    <Styled.StyledToggleButton
                    type="button" 
                    style={ buttonToggle[1].value ? {backgroundColor: 'black', color: 'white'} : {backgroundColor: 'white', color: 'black'} } 
                    onClick={() => {handleSort('AUTHOR'); handleButtonToggle('author');}}
                    >
                        Author
                    </Styled.StyledToggleButton>
                    {
                        buttonToggle[1].value ?
                        <Down height="16px" width="16px" />
                        :
                        <Up height="16px" width="16px"/>
                    }
                </span>
                <span style={{display: 'inline-block', width: '10%'}}>
                    <Styled.StyledToggleButton 
                    type="button" 
                    style={ buttonToggle[2].value ? {backgroundColor: 'black', color: 'white'} : {backgroundColor: 'white', color: 'black'} } 
                    onClick={() => {handleSort('COMMENT'); handleButtonToggle('comments');}}
                    >
                        Comments
                    </Styled.StyledToggleButton>
                    {
                        buttonToggle[2].value ?
                        <Down height="16px" width="16px" />
                        :
                        <Up height="16px" width="16px"/>
                    }
                </span>
                <span style={{display: 'inline-block', width: '10%'}}>
                    <Styled.StyledToggleButton 
                    type="button" 
                    style={ buttonToggle[3].value ? {backgroundColor: 'black', color: 'white'} : {backgroundColor: 'white', color: 'black'} } 
                    onClick={() => {handleSort('POINT'); handleButtonToggle('points');}}
                    >
                        Points
                    </Styled.StyledToggleButton>
                    {
                        buttonToggle[3].value ?
                        <Down height="16px" width="16px" />
                        :
                        <Up height="16px" width="16px"/>
                    }
                </span>
                <span>Actions</span>
            </div>
        
        {sortedList.map((item: Story) => (
            <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        ))}
        </div>
    );
};

type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => (
    <Styled.StyledItem>
        <Styled.StyledColumn  style={{width: '40%'}}>
        <a href={item.url}>{item.title}</a>
        </Styled.StyledColumn>
        <Styled.StyledColumn style={{width: '30%'}}>{item.author}</Styled.StyledColumn>
        <Styled.StyledColumn style={{width: '10%'}}>{item.num_comments}</Styled.StyledColumn>
        <Styled.StyledColumn style={{width: '10%'}}>{item.points}</Styled.StyledColumn>
        <Styled.StyledColumn style={{width: '10%'}}>
        <Styled.StyledButtonSmall 
            type="button" 
            onClick={() => onRemoveItem(item)}
        >
            <Remove data-testid="check" height="18px" width="18px" />
        </Styled.StyledButtonSmall>
        </Styled.StyledColumn>
    </Styled.StyledItem>
);

export { List };